import {useRouter} from "next/router";

export default function Page3({serverSideId}) {
    const router = useRouter();
    const {id, dynamicParam} = router.query;
    return (
        <div>
            <div><b>Full reload</b> the page and see magic</div> <br/>
            <div>Query Param Received By next/router: {id}</div>
            <div>Dynamic Param Received By next/router: {dynamicParam}</div>
            <div>Dynamic Param Received By Server Side: {serverSideId}</div> <br/>
            <button onClick={() => router.back()}>Prev Page</button>
        </div>
    )
}

export async function getServerSideProps(context) {
    const id = context.query.dynamicParam;
    return {
        props: {
            serverSideId: id,
        },
    };
}
