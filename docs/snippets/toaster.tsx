import { Toaster } from "@openwarelabs/ui";

export function App() {
    return (
        <>
            <Routes />
            <Toaster /> {/* once, anywhere: toast() works from any file after this */}
        </>
    );
}
