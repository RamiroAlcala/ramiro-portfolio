import "./Console.css";

export default function PromptLine({ user = "ramiro", host = "kali", path = "~", command = "" }) {
  return (
    <div className="prompt-line">
      <span className="prompt-user">{user}@{host}</span>
      <span className="prompt-separator">:</span>
      <span className="prompt-path">{path}</span>
      <span className="prompt-dollar">$ </span>
      {command && <span className="prompt-command">{command}</span>}
    </div>
  );
}
