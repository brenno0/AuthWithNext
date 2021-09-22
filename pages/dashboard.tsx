import { useAuth } from "../contexts/AuthContext"

export default function Dashboard() {
    const  {user} = useAuth()
    return (
        <>
            <h1>Dashboard</h1>
            <h1>Bem vindo {user?.email}</h1>
        </>
    )
}