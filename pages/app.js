import {useRouter} from "next/router";

export default function Home({testParam}) {
    const router = useRouter();
  return (
    <div>
      <div>Testing Purpose... </div> <br/>
      <div>BASEPATH from env: {process.env.NEXT_PUBLIC_BASEPATH}</div> <br/>
        <button onClick={() => router.push({
            pathname: "/route1/1002",
            query: {
                id: 1001
            }
        })}>Click Me</button>
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
