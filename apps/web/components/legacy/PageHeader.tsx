import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  breadcrumbs: { name: string; link?: string }[];
}

export default function PageHeader({ title, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="container-xxl py-5 bg-dark hero-header mb-5">
      <div className="container text-center my-5 pt-5 pb-4">
        <h1 className="display-3 text-white mb-3 animated slideInDown">{title}</h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb justify-content-center text-uppercase">
            {breadcrumbs.map((crumb, index) => (
              <li
                key={index}
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'text-white active' : ''}`}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.link ? (
                  <Link href={crumb.link} className="text-primary">
                    {crumb.name}
                  </Link>
                ) : (
                  crumb.name
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
