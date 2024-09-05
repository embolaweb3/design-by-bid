import { useEffect, useState } from 'react';
import { fetchProjects } from '../app/utilities/contract';
import ProjectList from '../app/components/ProjectList';

const Home = () => {
  const [projects, setProjects] = useState([]);

  let walletConnector:any

  if(typeof window !==undefined){
    walletConnector = (window as any).ethereum
  }
  

  useEffect(() => {
    if (walletConnector) {
      
      fetchProjects(library).then(setProjects);
    }
  }, [walletConnector]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">DesignByBid Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
};

export default Home;