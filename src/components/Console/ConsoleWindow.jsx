import { useCallback } from "react";
import cvData from "../../data/cvData.js";
import SectionBlock from "./SectionBlock";
import PromptLine from "./PromptLine";
import "./Console.css";

const { profile, education, experience, skills, courses, projects, languages, interests } = cvData;

export default function ConsoleWindow({ onCertificateClick, setIsOverConsole }) {
  const handleMouseEnter = useCallback(() => setIsOverConsole(true), [setIsOverConsole]);
  const handleMouseLeave = useCallback(() => setIsOverConsole(false), [setIsOverConsole]);

  return (
    <div
      className="console-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="console-titlebar">
        <div className="titlebar-dots">
          <span className="dot dot-close" />
          <span className="dot dot-minimize" />
          <span className="dot dot-maximize" />
        </div>
        <span className="titlebar-text">
          {profile.username}@{profile.hostname}: ~
        </span>
      </div>

      <div className="console-body">
        <section className="section-block">
          <PromptLine user={profile.username} host={profile.hostname} command="whoami --verbose" />
          <div className="section-output header-output">
            <h1 className="header-name">{profile.name}</h1>
            <p className="header-title">{profile.title}</p>
            <p className="header-summary">{profile.summary}</p>
            <div className="header-contact">
              <span>📍 {profile.location}</span>
              <span>✉ {profile.email}</span>
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </section>

        <SectionBlock sectionName="educacion" user={profile.username} host={profile.hostname}>
          {education.map((edu) => (
            <div key={edu.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{edu.degree}</span>
                <span className="entry-period">{edu.period}</span>
              </div>
              <p className="entry-subtitle">
                {edu.institution} — <span className="status-badge">{edu.status}</span>
              </p>
              <ul className="entry-details">
                {edu.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="experiencia" user={profile.username} host={profile.hostname}>
          {experience.map((exp) => (
            <div key={exp.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{exp.role}</span>
                <span className="entry-period">{exp.period}</span>
              </div>
              <p className="entry-subtitle">{exp.company}</p>
              <ul className="entry-details">
                {exp.description.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="skills" user={profile.username} host={profile.hostname}>
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="skill-group">
              <span className="skill-category">[{category}]</span>
              <div className="skill-tags">
                {items.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="certificados" user={profile.username} host={profile.hostname}>
          <p className="section-hint">// click en un certificado para ver el archivo</p>
          {courses.map((cert) => (
            <div
              key={cert.id}
              className={`cert-entry ${cert.certificateFile ? "cert-clickable" : ""}`}
              onClick={() => cert.certificateFile && onCertificateClick(cert)}
              role={cert.certificateFile ? "button" : undefined}
              tabIndex={cert.certificateFile ? 0 : undefined}
              onKeyDown={(e) => {
                if (cert.certificateFile && (e.key === "Enter" || e.key === " ")) {
                  onCertificateClick(cert);
                }
              }}
            >
              <span className="cert-icon">{cert.certificateFile ? "📄" : "○"}</span>
              <span className="cert-name">{cert.name}</span>
              <span className="cert-issuer">— {cert.issuer}</span>
              <span className="cert-date">[{cert.date}]</span>
            </div>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="proyectos" user={profile.username} host={profile.hostname}>
          {projects.map((proj) => (
            <div key={proj.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">
                  {proj.link ? (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer">
                      {proj.name} ↗
                    </a>
                  ) : (
                    proj.name
                  )}
                </span>
              </div>
              <p className="entry-description">{proj.description}</p>
              <div className="skill-tags">
                {proj.technologies.map((t, i) => (
                  <span key={i} className="skill-tag tag-small">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="idiomas" user={profile.username} host={profile.hostname}>
          {languages.map((lang, i) => (
            <p key={i} className="lang-entry">
              <span className="lang-name">{lang.name}</span>: {lang.level}
            </p>
          ))}
        </SectionBlock>

        <SectionBlock sectionName="intereses" user={profile.username} host={profile.hostname}>
          <ul className="entry-details">
            {interests.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </SectionBlock>

        <div className="console-footer">
          <PromptLine user={profile.username} host={profile.hostname} command="" />
          <span className="cursor-blink">█</span>
        </div>
      </div>
    </div>
  );
}
