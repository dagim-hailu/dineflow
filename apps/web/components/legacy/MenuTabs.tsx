'use client';
import React, { useState } from 'react';

interface MenuTab {
  id: string;
  icon: string;
  subtitle: string;
  title: string;
  items: {
    id: string | number;
    name: string;
    price: number;
    description: string;
    image: string;
  }[];
}

interface MenuTabsProps {
  tabs: MenuTab[];
}

export default function MenuTabs({ tabs }: MenuTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="tab-class text-center wow fadeInUp" data-wow-delay="0.1s">
      <ul className="nav nav-pills d-inline-flex justify-content-center border-bottom mb-5">
        {tabs.map((tab, index) => (
          <li className="nav-item" key={tab.id}>
            <a
              className={`d-flex align-items-center text-start mx-3 ${index === 0 ? 'ms-0' : ''} ${index === tabs.length - 1 ? 'me-0' : ''} pb-3 ${activeTab === tab.id ? 'active' : ''}`}
              data-bs-toggle="pill"
              href={`#${tab.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
            >
              <i className={`fa ${tab.icon} fa-2x text-primary`}></i>
              <div className="ps-3">
                <small className="text-body">{tab.subtitle}</small>
                <h6 className="mt-n1 mb-0">{tab.title}</h6>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            id={tab.id}
            className={`tab-pane fade p-0 ${activeTab === tab.id ? 'show active' : ''}`}
            key={tab.id}
          >
            <div className="row g-4">
              {tab.items.map((item) => (
                <div className="col-lg-6" key={item.id}>
                  <div className="d-flex align-items-center">
                    <img
                      className="flex-shrink-0 img-fluid rounded"
                      src={item.image}
                      alt={item.name}
                      style={{ width: '80px' }}
                    />
                    <div className="w-100 d-flex flex-column text-start ps-4">
                      <h5 className="d-flex justify-content-between border-bottom pb-2">
                        <span>{item.name}</span>
                        <span className="text-primary">${item.price}</span>
                      </h5>
                      <small className="fst-italic">{item.description}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
