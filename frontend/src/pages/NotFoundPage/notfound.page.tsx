import { Link } from 'react-router-dom';
import { GitCommit, HelpCircle, ArrowRight } from 'lucide-react';

export function NotFoundPage() {
  const exampleLink = '/repositories/uvaprasaath/google-form-clone-project/commit/c05e09040cfb46a4f89a76aa5f4f941f30f8cad8';

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
          <HelpCircle className="w-10 h-10 text-indigo-600 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 bg-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-[10px] font-bold border border-white">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Route Not Found</h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            The path you are trying to access does not match any configured route in the application.
          </p>
        </div>

        <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-150 text-left space-y-3">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Try Viewing an Example Commit
          </span>
          <Link
            to={exampleLink}
            className="flex items-center justify-between group p-3 bg-white hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-200 rounded-lg text-xs transition-all duration-200 shadow-sm cursor-pointer text-decoration-none"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <GitCommit className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-mono text-zinc-600 group-hover:text-indigo-900 truncate">
                uvaprasaath/google-form-clone-project (c05e090)
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to={exampleLink}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg py-2 px-5 text-xs transition-colors cursor-pointer border-none"
          >
            Go to Example Commit
          </Link>
        </div>
      </div>
    </div>
  );
}
