import {useRouter} from "next/router";

export default function Page3({serverSideId}) {
    const router = useRouter();
    const {id, dynamicParam} = router.query;
    return (
        <div>
            <div>This is page 2</div> <br/>
            <button onClick={() => router.back()}>Go Back</button>
            <div>Query Param Received By next/router: {id}</div>
            <div>Dynamic Param Received By next/router: {dynamicParam}</div>
            <div>Query Param Received By Server Side: {serverSideId}</div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const id = context.query.id;
    return {
        props: {
            serverSideId: id,
        },
    };
}
