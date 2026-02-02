import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/auth/layout/Header";
import Link from "next/link";
import Breadcrumbs from "@/components/auth/layout/Breadcrumbs";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>

            <div className="h-screen flex flex-col">
                <Header />

                <div className="flex flex-1">
                    {/* Sidebar */}
                    <aside className="w-60 bg-gray-100 border-r p-4 text-black">
                        <h2 className="font-semibold mb-4">Admin</h2>
                        <nav className="space-y-2 text-black
                        ">
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/dashboard">
                                Dashboard
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/departments">
                                Departments
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/roles">
                                Roles
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/employees">
                                Employees
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/payroll">
                                Payroll
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/attendance">
                                Attendance
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/projects">
                                Projects
                            </Link>
                            <Link className="block px-3 py-2 rounded hover:bg-gray-200 text-black" href="/settings">
                                Configure
                            </Link>
                        </nav>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 p-6 bg-white overflow-auto">
                        <Breadcrumbs />
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
