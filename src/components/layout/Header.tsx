
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle';

const Header = () => {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="font-bold text-2xl text-brand-700 dark:text-brand-400">
            ResponseFlow
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 font-medium">
              Dashboard
            </Link>
            <Link to="/users" className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 font-medium">
              Utilizadores
            </Link>
            <Link to="/responses" className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 font-medium">
              Respostas
            </Link>
            <Link to="/settings" className="text-foreground hover:text-brand-600 dark:hover:text-brand-400 font-medium">
              Configurações
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link 
            to="/docs" 
            className="text-sm text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400"
          >
            Documentação
          </Link>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors">
            Processar Respostas
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
