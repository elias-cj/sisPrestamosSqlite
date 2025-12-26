import { Link } from '@inertiajs/react';

export default function Pagination({ links }: { links: any[] }) {
    if (links.length <= 3) return null;

    const translateLabel = (label: string) => {
        return label
            .replace('&laquo; Previous', '&laquo; Anterior')
            .replace('Next &raquo;', 'Siguiente &raquo;');
    };

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, key) => (
                <div key={key}>
                    {link.url === null ? (
                        <div
                            className="mr-1 mb-1 px-3 py-2 text-sm leading-4 text-gray-400 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-500"
                            dangerouslySetInnerHTML={{ __html: translateLabel(link.label) }}
                        />
                    ) : (
                        <Link
                            className={`mr-1 mb-1 px-3 py-2 text-sm leading-4 border rounded-lg focus:text-indigo-500 focus:border-indigo-500 hover:bg-white dark:hover:bg-zinc-700
                            ${link.active ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-600' : 'bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300'}`}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: translateLabel(link.label) }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
