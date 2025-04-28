import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from './components/layouts/MainLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const TicketsPage = lazy(() => import('./pages/TicketsPage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <HomePage />
                    </Suspense>
                )
            },
            {
                path: "tickets",
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <TicketsPage />
                    </Suspense>
                )
            },
            {
                path: "events",
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <EventsPage />
                    </Suspense>
                )
            },
            {
                path: "profile",
                element: (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProfilePage />
                    </Suspense>
                )
            }
        ]
    }
])