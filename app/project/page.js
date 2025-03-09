"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('portfolio').select('*');
      if (error) {
        console.error("Erreur de récupération des projets:", error);
      } else {
        setProjects(data);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <h1>Liste des projets</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
