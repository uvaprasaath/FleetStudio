import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { 
  GitCommit, 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  ChevronDown,
  Clock,
  Layers,
  FileCode,
  ArrowRight,
  User
} from 'lucide-react';
import { 
  getCommitDetails, 
  getCommitDiff
} from './services/api';
import type { 
  SimplifiedCommit, 
  DiffFile 
} from './services/api';

// Helper to format date into "X days ago" or similar friendly format
function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  } catch {
    return 'some time ago';
  }
}

// Single Common Diff Line Component
interface DiffLineProps {
  baseLineNumber: number | null;
  headLineNumber: number | null;
  content: string;
}

function DiffLine({ baseLineNumber, headLineNumber, content }: DiffLineProps) {
  const isAddition = headLineNumber !== null && baseLineNumber === null;
  const isDeletion = baseLineNumber !== null && headLineNumber === null;

  let bgClass = 'bg-white hover:bg-zinc-50';
  let numClass = 'text-zinc-400 border-r border-zinc-200 select-none bg-zinc-50/50';
  let textClass = 'text-zinc-800';
  let modifier = ' ';

  if (isAddition) {
    bgClass = 'bg-emerald-50/60 hover:bg-emerald-100/65';
    numClass = 'text-emerald-600 border-r border-emerald-200/60 select-none bg-emerald-50';
    textClass = 'text-emerald-950 font-medium';
    modifier = '+';
  } else if (isDeletion) {
    bgClass = 'bg-rose-50/60 hover:bg-rose-100/65';
    numClass = 'text-rose-600 border-r border-rose-200/60 select-none bg-rose-50';
    textClass = 'text-rose-950 font-medium';
    modifier = '-';
  }

  return (
    <div className={`flex w-full items-stretch ${bgClass} transition-colors border-b border-zinc-100 font-mono text-xs py-0.5`}>
      {/* Original Line Number */}
      <div className={`w-12 text-right pr-3 shrink-0 ${numClass}`}>
        {baseLineNumber !== null ? baseLineNumber : ''}
      </div>
      {/* New Line Number */}
      <div className={`w-12 text-right pr-3 shrink-0 ${numClass}`}>
        {headLineNumber !== null ? headLineNumber : ''}
      </div>
      {/* Modifier prefix (+/-) */}
      <div className={`w-6 text-center shrink-0 select-none ${
        isAddition ? 'text-emerald-500 font-bold bg-emerald-100/20' :
        isDeletion ? 'text-rose-500 font-bold bg-rose-100/20' : 'text-zinc-400'
      }`}>
        {modifier}
      </div>
      {/* Code Content Line */}
      <div className={`pl-4 pr-4 whitespace-pre-wrap break-all ${textClass}`}>
        {content}
      </div>
    </div>
  );
}

// File Diff Accordion Box Component
interface FileDiffBoxProps {
  file: DiffFile;
}

function FileDiffBox({ file }: FileDiffBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filePath = file.headFile?.path || file.baseFile?.path || '';

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
      {/* File Header / Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-3.5 bg-zinc-50 hover:bg-zinc-100/80 transition-colors flex items-center justify-between border-b border-zinc-200/80 cursor-pointer"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <span className="text-zinc-500 shrink-0">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
          <FileCode className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="font-mono text-xs font-semibold text-zinc-700 truncate" title={filePath}>
            {filePath}
          </span>
        </div>

        <div className="flex items-center space-x-3.5 shrink-0">
          {filePath.endsWith('.json') && (
            <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full font-mono">
              JSON Unescaped
            </span>
          )}
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider ${
            file.changeKind === 'ADDED' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
            file.changeKind === 'DELETED' ? 'text-rose-600 bg-rose-50 border-rose-200' :
            file.changeKind === 'RENAMED' ? 'text-amber-600 bg-amber-50 border-amber-200' :
            file.changeKind === 'COPIED' ? 'text-cyan-600 bg-cyan-50 border-cyan-200' :
            file.changeKind === 'TYPE_CHANGED' ? 'text-purple-600 bg-purple-50 border-purple-200' :
            'text-blue-600 bg-blue-50 border-blue-200'
          }`}>
            {file.changeKind}
          </span>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="divide-y divide-zinc-200">
          {file.hunks.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No content differences found in this file.
            </div>
          ) : (
            file.hunks.map((hunk, hunkIdx) => (
              <div key={hunkIdx}>
                {/* Hunk Header */}
                <div className="bg-indigo-50/40 border-b border-zinc-200/60 text-indigo-700 py-1.5 px-4 font-mono font-medium text-[11px] tracking-wide select-none">
                  {hunk.header}
                </div>
                {/* Lines mapping */}
                <div className="flex flex-col">
                  {hunk.lines.map((line, lineIdx) => (
                    <DiffLine
                      key={lineIdx}
                      baseLineNumber={line.baseLineNumber}
                      headLineNumber={line.headLineNumber}
                      content={line.content}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Git Commit Visualizer Dashboard / Redirect Page
function Dashboard() {
  const [owner, setOwner] = useState('octocat');
  const [repo, setRepo] = useState('Hello-World');
  const [sha, setSha] = useState('7fd1a60b01f91b314f59955a4e4d4e80d8edf11d');
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner && repo && sha) {
      navigate(`/repositories/${owner}/${repo}/commit/${sha}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-full w-fit mx-auto text-indigo-600">
            <GitCommit className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Git Diff Visualizer</h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Analyze hunk-level unified differences and parsed commit metadata directly.
          </p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Owner</label>
            <input 
              type="text" 
              required
              value={owner} 
              onChange={(e) => setOwner(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-800"
              placeholder="e.g. octocat"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Repository</label>
            <input 
              type="text" 
              required
              value={repo} 
              onChange={(e) => setRepo(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-800"
              placeholder="e.g. Hello-World"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Commit SHA / OID</label>
            <input 
              type="text" 
              required
              value={sha} 
              onChange={(e) => setSha(e.target.value)} 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-800"
              placeholder="e.g. 7fd1a60b..."
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 px-4 text-sm transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer border-none"
          >
            <span>Load Diff Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Git Commit Visualizer Route Page (Centered Layout for all screens)
function CommitPage() {
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
            onClick={() => navigate('/')}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg py-2.5 px-4 text-xs transition-colors cursor-pointer border-none"
          >
            Go Back Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCommitterDifferent = 
    commit.author.name !== commit.committer.name || 
    commit.author.date !== commit.committer.date;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 font-sans antialiased selection:bg-indigo-100/50 selection:text-indigo-800 pb-16">
      
      {/* Top Banner Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="font-bold text-xs uppercase tracking-wider text-indigo-600 hover:text-indigo-500 transition-colors bg-transparent border-none cursor-pointer flex items-center space-x-1.5"
          >
            <span>← Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-zinc-200 rounded bg-zinc-50 text-zinc-500 font-semibold">
              {owner} / {repository}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - Centered horizontally for all screen sizes */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Commit Details Card */}
        <section className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-4 min-w-0">
            {/* Author Avatar */}
            {commit.author.avatarUrl ? (
              <img 
                src={commit.author.avatarUrl} 
                alt={commit.author.name} 
                className="w-12 h-12 rounded-full border border-zinc-200 shrink-0 bg-zinc-100" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <h1 className="text-lg font-bold text-zinc-900 leading-snug">
                {commit.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">{commit.author.name}</span>
                <span>authored {timeAgo(commit.author.date)}</span>
              </div>
              {commit.body && (
                <p className="text-xs text-zinc-500 bg-zinc-50/50 border border-zinc-200/50 rounded px-3 py-2 whitespace-pre-wrap leading-relaxed">
                  {commit.body}
                </p>
              )}
            </div>
          </div>

          {/* Right Signature Metadata */}
          <div className="shrink-0 flex flex-col md:items-end text-xs space-y-3 pt-1 border-t md:border-t-0 border-zinc-100">
            {isCommitterDifferent && (
              <div className="text-right">
                <p className="text-zinc-500 text-[11px] leading-tight">
                  Committed by <span className="font-semibold text-zinc-700">{commit.committer.name}</span>
                </p>
                <p className="text-[10px] text-zinc-400">{timeAgo(commit.committer.date)}</p>
              </div>
            )}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center space-x-1.5 justify-start md:justify-end">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Commit</span>
                <span className="font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5 select-all">
                  {commit.oid}
                </span>
              </div>
              {commit.parents.length > 0 && (
                <div className="flex flex-col space-y-1">
                  {commit.parents.map(parent => (
                    <div key={parent.oid} className="flex items-center space-x-1.5 justify-start md:justify-end">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-zinc-400">Parent</span>
                      <span className="font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5 select-all">
                        {parent.oid}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Files Accordion List */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-2 pl-1">
            Diff Files ({diffFiles.length})
          </h2>
          <div className="space-y-4">
            {diffFiles.map((file, idx) => (
              <FileDiffBox key={idx} file={file} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/repositories/:owner/:repository/commit/:commitSHA" element={<CommitPage />} />
    </Routes>
  );
}

export default App;
