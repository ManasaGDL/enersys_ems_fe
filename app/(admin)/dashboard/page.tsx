import AuthGuard from "@/components/auth/AuthGuard";
export default function DashboardPage() {
    return <AuthGuard><h1>Dashboard</h1></AuthGuard>;
}
