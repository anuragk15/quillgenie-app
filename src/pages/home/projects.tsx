import { getProjects } from "@/api/functions/projects";
import { OnboardingOverviewContent } from "@/components/onboarding/overview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import LoadingState from "@/components/ui/loadingState";
import ProjectCard from "@/components/ui/projectCard";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user";
import OnboardingWrapper from "@/wrappers/onboarding";
import { useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, LogOut, Plus, Search, Settings, User } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function ProjectsScreen() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["get", "projects"],
    queryFn: async () => {
      const res = await getProjects();
      // const res = await getProjects();
      return res?.data;
    },
  });
 // console.log(projects);
  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <OnboardingWrapper
      component={<OnboardingOverviewContent />}
      showCloseButton={false}
    >
      <div className="bg-slate-50 min-h-screen ">
        <div className=" space-y-10">
          <div className="bg-white shadow-sm py-2 border-b">
            <div className=" max-w-[1280px] mx-auto">
              <Navbar />
            </div>
          </div>

          <div className=" px-5 md:px-10 space-y-4 max-w-[1280px] mx-auto">
            <h2 className="text-2xl font-sans">Your projects</h2>
            <div className="flex gap-4 w-full">
              {projects?.length > 0 &&
                projects.map((project) => (
                  <ProjectCard
                    role={
                      project?.collaborators?.accessLevel == "admin"
                        ? "Admin"
                        : project?.collaborators?.accessLevel == "manager"
                        ? "Manager"
                        : project?.collaborators?.accessLevel == "read"
                        ? "Viewer"
                        : "Editor"
                    }
                    name={project?.projects?.name}
                    id={project?.projects?.id}
                    createdOn={new Date(project?.projects?.createdAt)}
                  />
                ))}
              {/* <ProjectCard name="Project 1" id="1" createdOn={new Date()} />
              <ProjectCard name="Anurag" id="2" createdOn={new Date()} /> */}
              {/* <div className="group  py-4 px-4 bg-white flex flex-col justify-center items-center gap-4 rounded-lg hover:bg-slate-100 cursor-pointer border min-w-[20vw]">
                <div className=" p-4 border group-hover:border-black rounded-full border-dashed">
                  <Plus className=" text-slate-500 group-hover:text-black" />
                </div>
              </div> */}
            </div>
            {projects.length == 0 && (
              <div className="flex h-full  min-h-[60vh] justify-center items-center ">
                <div className=" space-y-4 border cursor-pointer p-20 group justify-center flex flex-col items-center hover:border-black rounded-xl border-dashed">
                  <Plus
                    size={64}
                    className=" text-slate-700 group-hover:text-black"
                  />
                  <h1 className=" text-2xl font-sans">
                    Create your first project
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OnboardingWrapper>
  );
}

const Navbar = () => {
  const { signOut } = useClerk();
  const { user } = useUserStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <h1
        className="text-3xl"
        style={{
          fontFamily: "Pacifico",
        }}
      >
        Novo
      </h1>
      <div className="flex gap-5 items-center">
        <div className=" flex gap-2 px-2 items-center bg-slate-100 rounded-xl">
          <Search color="gray" />
          <Input
            placeholder="Search projects..."
            className={cn(
              "border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-sans "
            )}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            {user?.photo ? (
              <img
                src={user?.photo}
                className="w-12  rounded-full"
                alt="User profile"
              />
            ) : (
              <User size={20} />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className=" mr-2">
            <DropdownMenuItem
              onClick={() => {
                setSearchParams({ onboarding: "true" });
              }}
              className="cursor-pointer flex items-center gap-2"
            >
              <Lightbulb size={14} />
              <p>Quick intro</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <Settings size={14} />
              <p>Settings</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="cursor-pointer flex items-center gap-2"
            >
              <LogOut size={14} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
