def call(params) {
    pipeline {
        agent {
            docker {
                registryUrl 'http://registryserver.ieims.local'
                registryCredentialsId 'harbor-dsi-registry'
                image 'dsi/deploy/agents:dsi-alpine-v1.0'
                args '-u 1001:988 --network host -v "/var/run/docker.sock:/var/run/docker.sock:rw" -v "/home/ieims_user/.kube:/.kube"'
                reuseNode true
            }
        }

        environment {
            HOME = "${WORKSPACE}"

            MODULE_CODE = "${params.MODULE_CODE}"
            PACKAGE_NAME = "${params.PACKAGE_NAME}"
            BUILD_NAME = "${params.BUILD_NAME}"
            DOCKER_FILE_NAME = "${params.DOCKER_FILE_NAME}"
            JAR_FILE = "${params.JAR_FILE}"

            TAG = "${params.TAG}"
            BUILD_NUMBER = "${env.BUILD_NUMBER}"
            BACKEND_REPOSITORY = 'registryserver.ieims.local/dsi/backend'
            FRONTEND_REPOSITORY = "registryserver.ieims.local/dsi/frontend/${scope}"

            KUBECONFIG = "/.kube/ieims-cluster-config"
            DATE = getCurrentDate(currentBuild)

            // Batch specific configurations
            batch = "${params.ENABLE_BATCH}"
            BATCH_MODULE_CODE = "${params.BATCH_MODULE_CODE}"
            BATCH_PACKAGE_NAME = "${params.BATCH_PACKAGE_NAME}"
            BATCH_JAR_FILE = "${params.BATCH_JAR_FILE}"
        }

        stages {

            stage('backend') {
                when { expression { backend == 'true' } }

                stages {
                    stage('git-pull') {
                        steps {
                            dir('ieims-mono') {
                                git branch: 'main', credentialsId: 'dsi-ieims-readonly', url: 'https://github.com/ieims/ieims-mono.git'
                            }
                        }
                    }
                    stage('maven-build') {
                        steps {
                            dir("ieims-mono/backend/${PACKAGE_NAME}") {
                                sh "mvn clean package -DskipTests"
                            }
                        }
                    }
                    stage('image-build-push') {
                        steps {
                            dir("ieims-mono/backend/${PACKAGE_NAME}") {
                                sh "docker build --build-arg JAR_FILE=${JAR_FILE} -t ${BACKEND_REPOSITORY}:${MODULE_CODE}-${TAG} -f Dockerfile ."
                                sh "docker push ${BACKEND_REPOSITORY}:${MODULE_CODE}-${TAG}"
                            }
                        }
                    }

                    stage('deploy') {
                        steps {
                            // script {
                            //     def releaseName = "${scope}-config"
                            //     def deployType = releaseExists("${releaseName}", "${scope}") ? "upgrade" : "install"
                            //     dir("ieims-mono/helm") {
                            //         sh "helm ${deployType} ${releaseName} config --dry-run"
                            //     }
                            // }
                            script {
                                def releaseName = "backend-${MODULE_CODE}"
                                def deployType = releaseExists("${releaseName}", "${scope}") ? "upgrade" : "install"
                                dir("ieims-mono/helm") {
                                    sh "helm ${deployType} ${releaseName} ieims --values values/values.${scope}.yaml --set type=backend --set moduleCode=${MODULE_CODE} --namespace=${scope} --dry-run"
                                }
                            }
                        }
                    }

                }
            }

            stage('frontend') {
                when { expression { frontend == 'true' } }

                stages {
                    stage('env-generate') {
                        steps {
                            dir("ieims-mono") {
                                sh "python3 scripts/cluster_env_changer.py --boardCode=${scope} --moduleCode=${MODULE_CODE} --hostName=cluster.ieims.org --globalName=global --deploymentType=local"
                            }
                        }
                    }
                    stage('npm-install-transpile') {
                        steps {
                            dir("ieims-mono/frontend") {
                                sh "npm i --legacy-peer-deps"
                                sh "npm run transpile"
                            }
                        }
                    }
                    stage('npm-build') {
                        steps {
                            dir("ieims-mono/frontend") {
                                sh "npm run build:${BUILD_NAME}"
                            }
                        }
                    }
                    stage('image-build-push') {
                        steps {
                            dir("ieims-mono/frontend") {
                                sh "docker build -t ${FRONTEND_REPOSITORY}:${MODULE_CODE}-${TAG} -f ${DOCKER_FILE_NAME} ."
                                sh "docker push ${FRONTEND_REPOSITORY}:${MODULE_CODE}-${TAG}"
                            }
                        }
                    }
                    stage('deploy') {
                        steps {
                            script {
                                def releaseName = "frontend-${MODULE_CODE}"
                                def deployType = releaseExists("${releaseName}", "${scope}") ? "upgrade" : "install"
                                dir("ieims-mono/helm") {
                                    sh "helm ${deployType} ${releaseName} ieims --values values/values.${scope}.yaml --set type=frontend --set moduleCode=${MODULE_CODE} --namespace=${scope} --dry-run"
                                }
                            }
                        }
                    }
                }
            }

            stage('batch') {
                when { expression { propertyDefined('batch') && batch == 'true' } }
                stages {
                    stage('maven-build') {
                        steps {
                            dir("ieims-mono/backend/${BATCH_PACKAGE_NAME}") {
                                sh "mvn clean package -DskipTests"
                            }
                        }
                    }
                    stage('image-build-push') {
                        steps {
                            dir("ieims-mono/backend/${BATCH_PACKAGE_NAME}") {
                                sh "docker build --build-arg JAR_FILE=${BATCH_JAR_FILE} -t ${BACKEND_REPOSITORY}:${BATCH_MODULE_CODE}-${TAG} -f Dockerfile ."
                                sh "docker push ${BACKEND_REPOSITORY}:${BATCH_MODULE_CODE}-${TAG}"
                            }
                        }
                    }

                    stage('deploy') {
                        steps {
                            // script {
                            //     def releaseName = "${scope}-config"
                            //     def deployType = releaseExists("${releaseName}", "${scope}") ? "upgrade" : "install"
                            //     dir("ieims-mono/helm") {
                            //         sh "helm ${deployType} ${releaseName} config --dry-run"
                            //     }
                            // }
                            script {
                                def releaseName = "backend-${BATCH_MODULE_CODE}"
                                def deployType = releaseExists("${releaseName}", "${scope}") ? "upgrade" : "install"
                                dir("ieims-mono/helm") {
                                    sh "helm ${deployType} ${releaseName} ieims --values values/values.${scope}.yaml --set type=backend --set moduleCode=${BATCH_MODULE_CODE} --namespace=${scope} --dry-run"
                                }
                            }
                        }
                    }
                }
            }

        }

        // post {
        //     always {
        //       deleteDir()
        //     }
        // }

    }
}

def releaseExists(releaseName, scope) {
    def helmListOutput = sh(script: "helm list -n ${scope}", returnStdout: true).trim()
    return helmListOutput.contains("${releaseName}")
}

def getCurrentDate(currentBuild) {
    def currentDate = new Date(currentBuild.startTimeInMillis)
    return currentDate.format("yyyy-MM-dd")
}
