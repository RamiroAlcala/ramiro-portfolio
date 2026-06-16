import PromptLine from "./PromptLine";
import "./Console.css";

export default function SectionBlock({ sectionName, user, host, children }) {
  return (
    <section className="section-block">
      <PromptLine
        user={user}
        host={host}
        path={`~/${sectionName}`}
        command={`cat ${sectionName}.txt`}
      />
      <div className="section-output">
        {children}
      </div>
    </section>
  );
}
