
export default function Unauthorized({}) {
    return (
        <div>
            <span>401 Unauthorized</span>
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
