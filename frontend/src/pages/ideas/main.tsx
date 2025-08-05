import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useAuth } from "../../Auth/useAuth";
import api from "../../api/axios";
import { Link } from "react-router-dom";

interface IIdea {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username: string;
  };
}
export default function Main() {
  const { user, accessToken } = useAuth();
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [showSection, setShowSection] = useState<"normal" | "Create Idea">(
    "normal",
  );

  // 1. Create a memoized function to fetch ideas
  const fetchIdeas = useCallback(async () => {
    if (user && accessToken) {
      try {
        const response = await api.get(`users/${user.id}/ideas`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setIdeas(response.data);
      } catch (error) {
        console.error("Failed to fetch ideas:", error);
      }
    }
  }, [user, accessToken]);

  // 2. Call fetchIdeas on initial load and when it changes
  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  return (
    <div className="fixed min-h-screen w-full bg-neutral-800">
      <main className="mx-auto flex min-h-screen max-w-[1400px] justify-center bg-neutral-800">
        <div className="mt-50 flex h-fit w-fit flex-col gap-5">
          {showSection === "normal" &&
            (ideas.length > 0 ? (
              <div className="flex flex-col gap-20">
                <Link to="/profile">
                  <button className="mt-4 cursor-pointer rounded-2xl bg-blue-400 p-3 font-bold text-neutral-100 hover:bg-blue-400/95">
                    Go to profile
                  </button>
                </Link>
                <button
                  onClick={() => setShowSection("Create Idea")}
                  className="cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[19px] font-bold text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
                >
                  create
                </button>
                {ideas.map((idea) => (
                  <Idea idea={idea} key={idea.id} />
                ))}
              </div>
            ) : (
              <div className="flex h-fit w-fit flex-col gap-10 text-neutral-200">
                <a href="/profile" className="w-full">
                  <button className="mt-4 cursor-pointer rounded-2xl bg-blue-400 p-3 font-bold text-neutral-100 hover:bg-blue-400/95">
                    Go to profile
                  </button>
                </a>
                <div>You don't have any ideas. Click to create one.</div>
                <button
                  onClick={() => setShowSection("Create Idea")}
                  className="cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[19px] font-bold text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
                >
                  create
                </button>
              </div>
            ))}
          {showSection === "Create Idea" && (
            <CreateIdeaSection
              setShowSection={setShowSection}
              onIdeaCreated={fetchIdeas}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Idea({ idea }: { idea: IIdea }) {
  return (
    <div className="flex h-fit w-80 flex-col items-start gap-3.5 rounded-2xl bg-amber-500 p-4">
      <h1 className="self-center text-[18px] font-bold text-neutral-700">
        {idea.name}
      </h1>
      <div className="font-bold text-neutral-100">{idea.description}</div>
    </div>
  );
}

interface ICreateIdeaSectionProps {
  setShowSection: Dispatch<SetStateAction<"normal" | "Create Idea">>;
  onIdeaCreated: () => Promise<void>;
}
function CreateIdeaSection({
  setShowSection,
  onIdeaCreated,
}: ICreateIdeaSectionProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const createIdea = async () => {
    setIsLoading(true);
    try {
      const ideaData = { name, description };
      await api.post("/ideas", ideaData);
      setShowSection("normal");
      await onIdeaCreated();
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-fit w-screen max-w-200 min-w-60 flex-col gap-5 rounded-3xl bg-black/20 p-2 py-10">
      <div className="flex h-fit w-full flex-col items-center">
        <h1 className="text-2xl font-bold text-neutral-300">IDEA</h1>
        <div className="flex w-full flex-col gap-3 p-2">
          <h1 className="text-neutral-200">Name</h1>
          <input
            type="text"
            className="h-14 w-full rounded-2xl bg-neutral-400 p-1 text-black/80"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-3 p-2">
          <h1 className="text-neutral-200">Description</h1>
          <textarea
            className="h-30 w-full rounded-2xl bg-neutral-400 p-2 text-black/80"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
      </div>
      <button
        onClick={createIdea}
        className="w-full cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[18px] text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
        disabled={isLoading}
      >
        create
      </button>
      <button
        onClick={() => setShowSection("normal")}
        className="w-full cursor-pointer rounded-2xl bg-blue-400 p-2 px-8 text-[18px] text-neutral-100 hover:bg-blue-400/90 disabled:bg-blue-500"
      >
        get back
      </button>
    </div>
  );
}
