import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

export default function TemplateCard({
  index,
  name,
  description,
  tags,
  id,
  fields,
  setSelectedTemplate,
}) {
  const Tag = ({ text }) => {
    return (
      <p className="px-2 font-mono py-0 rounded-lg text-xs lg:text-sm text-slate-600 shadow-sm bg-slate-200">
        {text}
      </p>
    );
  };
  return (
    <div className="relative h-full ">
      <div className="p-2 bg-slate-100 rounded-full absolute top-2 right-2 z-50">
        <Bookmark
          className=" cursor-pointer "
          onClick={() => {
            console.log(id);
            console.log(fields);
          }}
          size={18}
        />
      </div>

      <div
        onClick={() => {
          console.log(id);
          console.log(fields);
          setSelectedTemplate({ id, fields, name, description });
        }}
        className={cn(
          "md:border-r relative cursor-pointer flex flex-col justify-between h-full px-4 space-y-5 py-4 hover:bg-slate-100",
          index % 3 == 0 && "md:border-none"
        )}
      >
        <div className="space-y-2">
          <div className=" font-mono text-xl"># {name}</div>

          <div className=" font-sans text-slate-600">{description}</div>
        </div>
        <div className="flex py-2 flex-wrap gap-2">
          {tags.map((tag, i) => (
            <Tag key={i} text={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}
