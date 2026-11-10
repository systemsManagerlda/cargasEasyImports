'use client';

import React from 'react';
import { Package, Heart, Mail } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface FooterProps {
  className?: string;
  showSocial?: boolean;
  showVersion?: boolean;
  companyName?: string;
  year?: number;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  showSocial = true,
  showVersion = true,
  companyName = 'Sistema de Rastreio de Cargas',
  year = new Date().getFullYear(),
}) => {
  const currentYear = year || new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-white border-t border-gray-200 py-6 px-4',
      className
    )}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {companyName}
            </span>
            {showVersion && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                v1.0.0
              </span>
            )}
          </div>

          {/* Direitos Autorais */}
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <span>© {currentYear}</span>
            <span>{companyName}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Todos os direitos reservados</span>
            <span className="flex items-center gap-1 mx-1">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </span>
          </div>

          {/* Redes Sociais */}
          {showSocial && (
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Github className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Twitter className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Linkedin className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Links Inferiores */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">
            Termos de Uso
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" className="hover:text-gray-600 transition-colors">
            Política de Privacidade
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" className="hover:text-gray-600 transition-colors">
            Suporte
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" className="hover:text-gray-600 transition-colors">
            Contato
          </a>
        </div>
      </div>
    </footer>
  );
};

// ================================================================
// VARIANTE SIMPLES DO FOOTER
// ================================================================

interface FooterSimpleProps {
  className?: string;
  companyName?: string;
  year?: number;
}

export const FooterSimple: React.FC<FooterSimpleProps> = ({
  className,
  companyName = 'Sistema de Rastreio de Cargas',
  year = new Date().getFullYear(),
}) => {
  const currentYear = year || new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-white border-t border-gray-200 py-4 px-4',
      className
    )}>
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-500">
          © {currentYear} {companyName}. Todos os direitos reservados.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Sistema de Rastreio de Cargas v1.0.0
        </p>
      </div>
    </footer>
  );
};

// ================================================================
// VARIANTE DARK DO FOOTER
// ================================================================

interface FooterDarkProps {
  className?: string;
  companyName?: string;
  year?: number;
  showSocial?: boolean;
}

export const FooterDark: React.FC<FooterDarkProps> = ({
  className,
  companyName = 'Sistema de Rastreio de Cargas',
  year = new Date().getFullYear(),
  showSocial = true,
}) => {
  const currentYear = year || new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-gray-900 border-t border-gray-800 py-6 px-4',
      className
    )}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-300">
              {companyName}
            </span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              v1.0.0
            </span>
          </div>

          {/* Direitos Autorais */}
          <div className="text-sm text-gray-500">
            © {currentYear} {companyName}. Todos os direitos reservados.
          </div>

          {/* Redes Sociais */}
          {showSocial && (
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Github className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Twitter className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* <Linkedin className="w-4 h-4" /> */}
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Email"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;