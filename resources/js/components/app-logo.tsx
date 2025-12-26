import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export default function AppLogo() {
    const { company } = usePage<any>().props;
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className={cn(
            "flex items-center transition-all duration-300 w-full overflow-hidden",
            isCollapsed ? "justify-center" : "justify-start gap-3 px-2 py-1"
        )}>
            <div className={cn(
                "flex items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition-all duration-300 overflow-hidden shrink-0",
                isCollapsed ? "size-8" : "size-12 shadow-md"
            )}>
                {company?.logo ? (
                    <img src={`/storage/${company.logo}`} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                    <AppLogoIcon className={cn(
                        "fill-current text-white dark:text-black transition-all",
                        isCollapsed ? "size-4" : "size-6"
                    )} />
                )}
            </div>

            {!isCollapsed && (
                <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-2 duration-500 overflow-hidden">
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate w-full">
                        {company?.nombre || 'SisPrestamos'}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 tracking-wider uppercase truncate">
                        Gestión
                    </span>
                </div>
            )}
        </div>
    );
}
