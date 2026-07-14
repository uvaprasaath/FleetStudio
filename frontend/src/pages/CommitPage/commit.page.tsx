import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  getCommitDetails, 
  getCommitDiff
} from '../../services/api';
import type { 
  SimplifiedCommit, 
  DiffFile 
} from '../../services/api';
import { AlertCircle, Clock, Layers, Loader2, User } from "lucide-react";
import { FileDiffBox, timeAgo } from "./commitpage.components";
import { bodyTextStyle, linkMonoSpaceStyle, textHeaderStyle } from "../../lib/constants";

export function CommitPage() {
  const { owner, repository, commitSHA } = useParams<{ owner: string; repository: string; commitSHA: string }>();
  const navigate = useNavigate();

  const [commit, setCommit] = useState<SimplifiedCommit | null>(null);
  const [diffFiles, setDiffFiles] = useState<DiffFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!owner || !repository || !commitSHA) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const details = await getCommitDetails(owner, repository, commitSHA);
        const diffs = await getCommitDiff(owner, repository, commitSHA);
        
        setCommit(details);
        setDiffFiles(diffs);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the commit data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, repository, commitSHA]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Analyzing Commit Diff...</span>
      </div>
    );
  }

  if (error || !commit) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-6 shadow-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-900">Analysis Failed</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">{error || 'Failed to load commit data.'}</p>
          </div>
          <button 
            onClick={() =>{
              window.location.reload();
            }}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg py-2.5 px-4 text-xs transition-colors cursor-pointer border-none"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isCommitterDifferent = commit.author.name !== commit.committer.name || commit.author.date !== commit.committer.date;

   

    return (
      <div className="min-h-screen bg-background ">
       
        <div className="max-w-5xl flex flex-col mx-auto">

          {/** Header */}
         <div className="flex flex-row w-full justify-between py-2">
          {/* Author Info */}
           <div className="flex flex-row gap-0.5 max-w-[50%]">
               {commit.author.avatarUrl ? (
              <img 
                src={commit.author.avatarUrl} 
                alt={commit.author.name} 
                className="w-12 h-12 rounded-full  shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <p className={textHeaderStyle}>{commit.subject}</p>
              <p className={`${bodyTextStyle} text-muted`}>Authored by <span className="text-body font-semibold">{commit.author.name}</span> {timeAgo(commit.author.date)}</p>
              <p className={bodyTextStyle}>{commit.body}</p>
            </div>
           </div>

           {/* Commiter  info */}
           <div className="flex flex-col items-end self-end min-w-max">
            <p className={`${bodyTextStyle} text-muted`}>Commited by <span className="text-body font-semibold">{commit.committer.name}</span> {isCommitterDifferent && timeAgo(commit.committer.date)}</p>
            <p className={`${bodyTextStyle} text-muted`}>Commit <span className="text-body font-semibold">{commit.oid}</span></p>
            <p className={`${bodyTextStyle} text-muted`}>Parent <span className={linkMonoSpaceStyle}>{commit.parents.length>0 ? commit.parents[0].oid : ''}</span></p>
           </div>
         </div>

         {/* Files Accordion List */}
        <section >
          <div className="flex flex-col gap-0.5">
            {diffFiles.map((file, idx) => (
              <FileDiffBox key={idx} file={file} />
            ))}
          </div>
        </section>
      </div>
      </div>
    )

}