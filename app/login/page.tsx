import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <LoginForm />
        </div>
    );
}
