import {useRouter} from "next/router";

export default function Home({testParam}) {
    const router = useRouter();
    console.log(testParam)
  return (
    <div>
      <div>Testing Purpose... </div> <br/>
      <div>BASEPATH from env: {process.env.NEXT_PUBLIC_BASE_PATH}</div> <br/>
        <button onClick={() => router.push({
            pathname: "/home/route1/1002",
            query: {
                id: 1001
            }
        })}>Next Page</button>
    </div>
  )
}

export async function getServerSideProps() {
    return {
        props: {
            testParam: "testParam",
        },
    };
}
