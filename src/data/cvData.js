const cvData = {
  profile: {
    name: "Ramiro Alcala",
    title:
      "Estudiante Avanzado de Ingeniería Electrónica | Sistemas, Redes y Tecnologías de la Información",
    hostname: "kali",
    username: "ramiro",
    summary:
      "Estudiante avanzado de Ingeniería Electrónica (UNSJ) con experiencia en desarrollo web, bases de datos y atención al usuario. Conocimientos de Windows, Linux, virtualización y redes TCP/IP. Interés en soporte IT, infraestructura y ciberseguridad.",
    location: "San Juan, Argentina",
    email: "ramiroalcala11@gmail.com",
    linkedin: null,
    github: "https://github.com/RamiroAlcala",
  },

  education: [
    {
      id: "edu-1",
      institution:
        "Facultad de Ingeniería — Universidad Nacional de San Juan (UNSJ)",
      degree: "Ingeniería Electrónica",
      period: "En curso",
      status: "+60% de la carrera aprobada",
      details: [],
    },
  ],

  experience: [
    {
      id: "exp-1",
      company: "Freelance",
      role: "Desarrollador Fullstack Freelance",
      period: "2024 - Presente",
      description: [
        "Desarrollo de prototipos web utilizando React, Node.js, Flask y FastAPI.",
        "Integración de servicios de IA mediante API para automatización de procesos y generación de contenido.",
        "Despliegue de prototipos funcionales para validación de soluciones tecnológicas.",
        "Colaboración con clientes en el relevamiento de requerimientos y evaluación de propuestas.",
      ],
    },
    {
      id: "exp-2",
      company: "EPRE · Entidad Reguladora de la Electricidad, San Juan",
      role: "Pasante — Área de Tarifa Social",
      period: "2023 - 2025",
      description: [
        "Gestión y actualización de bases de datos vinculadas a programas de subsidios eléctricos.",
        "Utilización de Microsoft Excel y Access para control, validación y procesamiento de información.",
        "Atención telefónica a usuarios para seguimiento de trámites y resolución de consultas.",
        "Auditoría, digitalización y organización de expedientes técnicos y administrativos.",
      ],
    },
  ],

  skills: {
    systems: [
      "Windows",
      "Linux (Ubuntu, Kali)",
      "VirtualBox",
      "VMware",
    ],

    networking: [
      "TCP/IP",
      "DNS",
      "DHCP",
      "SSH",
    ],

    databases: [
      "Microsoft Access",
      "PostgreSQL",
      "MongoDB",
    ],

    programming: [
      "Python",
      "JavaScript",
      "Node.js",
      "React",
    ],
  },

  courses: [
    {
      id: "cert-1",
      name: "Web Application Pentesting",
      issuer: "TryHackMe",
      date: "2026",
      certificateFile: "/certificates/THM-JIGC390IVF.pdf",
      type: "pdf",
    },
    {
      id: "cert-2",
      name: "Curso Completo de Ciberseguridad Defensiva",
      issuer: "Udemy · Santiago Hernández",
      date: "2026",
      certificateFile:
        "/certificates/curso-completo-ciberseguridad-defensiva.pdf",
      type: "pdf",
    },
    {
      id: "cert-3",
      name: "Curso Avanzado de Hacking Ético y Ciberseguridad",
      issuer: "Udemy · Santiago Hernández",
      date: "2025",
      certificateFile:
        "/certificates/curso-avanzado-hacking-udemy.pdf",
      type: "pdf",
    },
    {
      id: "cert-4",
      name: "Web Fundamentals",
      issuer: "TryHackMe",
      date: "2025",
      certificateFile: "/certificates/THM-BAHGD11JP3.pdf",
      type: "pdf",
    },
    {
      id: "cert-5",
      name: "Curso Completo de Hacking Ético y Ciberseguridad",
      issuer: "Udemy · Santiago Hernández",
      date: "2024",
      certificateFile:
        "/certificates/curso-completo-Hacking-udemy.pdf",
      type: "pdf",
    },
    {
      id: "cert-6",
      name: "Introducción a Linux",
      issuer: "Hack4U · Marcelo Vázquez",
      date: "2024",
      certificateFile:
        "/certificates/linux-introduction.png",
      type: "image"
    },
  ],

  projects: [
    {
      id: "proj-2",
      name: "Next Level Tournament",
      description:
        "Aplicación web para gestión de torneos y ligas de juegos de cartas coleccionables.",
      technologies: [
        "React",
        "FastAPI",
        "Python",
        "PostgreSQL",
        "Supabase",
      ],
      link: "https://next-level-tournamentvercel.vercel.app/",
    },
  ],

  languages: [
    {
      name: "Inglés",
      level: "B1 - Lectura técnica y comprensión de documentación",
    },
  ],

  interests: [
    "Soporte IT",
    "Infraestructura",
    "Ciberseguridad",
    "Redes",
    "Electrónica",
  ],
};

export default cvData;