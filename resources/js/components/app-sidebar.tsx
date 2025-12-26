import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Banknote,
    Users,
    Briefcase,
    Wallet,
    Receipt,
    BarChart3,
    Settings,
    BookOpen,
    Folder,
    Trophy,
    User,
    Shield
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Usuarios',
        href: '/users',
        icon: User,
        permission: 'ver_usuarios',
    },
    {
        title: 'Roles y Permisos',
        href: '/roles',
        icon: Shield,
        permission: 'ver_roles',
    },
    {
        title: 'Monedas',
        href: '/currencies',
        icon: Banknote,
        permission: 'ver_configuracion',
    },
    {
        title: 'Socios',
        href: '/partners',
        icon: Briefcase,
        permission: 'ver_socios',
    },
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
        permission: 'ver_clientes',
    },
    {
        title: 'Préstamos',
        href: '/loans',
        icon: Banknote,
        permission: 'ver_prestamos',
    },
    {
        title: 'Cobros',
        href: '/payments',
        icon: Banknote,
        permission: 'registrar_pago',
    },
    {
        title: 'Rutas',
        href: '/rutas',
        icon: Folder,
        permission: 'registrar_pago',
    },
    {
        title: 'Gastos',
        href: '/expenses',
        icon: Receipt,
        permission: 'ver_gastos',
    },
    {
        title: 'Caja',
        href: '/cash',
        icon: Wallet,
        permission: 'ver_caja',
    },
    {
        title: 'Reportes',
        href: '/reports',
        icon: BarChart3,
        permission: 'ver_reportes',
    },
    {
        title: 'Ranking',
        href: '/ranking',
        icon: Trophy,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Configuración',
        href: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="transition-all duration-300">
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex items-center justify-center py-2 transition-all hover:opacity-80"
                >
                    <AppLogo />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
