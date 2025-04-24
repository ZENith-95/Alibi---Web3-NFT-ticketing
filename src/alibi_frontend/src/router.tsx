import HomePage from './pages/HomePage'
import TicketsPage from './pages/TicketsPage'
import EventsPage from './pages/EventsPage'
import ProfilePage from './pages/ProfilePage'
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from './components/layouts/MainLayout'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "tickets",
                element: <TicketsPage />
            },
            {
                path: "events",
                element: <EventsPage />
            },
            {
                path: "profile",
                element: <ProfilePage />
            }
        ]
    }
])