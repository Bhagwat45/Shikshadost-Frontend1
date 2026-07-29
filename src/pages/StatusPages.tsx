import { Link } from 'react-router-dom'
export function UnauthorizedPage() { return <Status title="Access denied" text="You do not have permission to view this page." /> }
export function NotFoundPage() { return <Status title="Page not found" text="The page you are looking for does not exist." /> }
function Status({ title, text }: { title: string; text: string }) { return <main className="grid min-h-screen place-items-center p-5 text-center"><div><p className="text-sm font-bold text-brand-600">ShikshaDost</p><h1 className="mt-3 text-4xl font-bold">{title}</h1><p className="mt-3 text-slate-600 dark:text-slate-300">{text}</p><Link to="/" className="mt-7 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white">Return home</Link></div></main> }
