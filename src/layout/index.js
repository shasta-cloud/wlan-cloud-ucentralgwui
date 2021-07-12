import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logout } from 'utils/authHelper';
import routes from 'routes';
import { useAuth } from 'contexts/AuthProvider';
import { Header, Sidebar, Footer, PageContainer } from 'ucentral-libs';

const TheLayout = () => {
  const [showSidebar, setShowSidebar] = useState('responsive');
  const { endpoints, currentToken } = useAuth();
  const { t, i18n } = useTranslation();

  const navigation = [
    {
      _tag: 'CSidebarNavItem',
      name: t('common.device_list'),
      to: '/devices',
      icon: 'cilNotes',
    },
  ];

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        logo="assets/OpenWiFi_LogoLockup_WhiteColour.svg"
        options={navigation}
      />
      <div className="c-wrapper">
        <Header
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          routes={routes}
          t={t}
          i18n={i18n}
          logout={logout}
          authToken={currentToken}
          endpoints={endpoints}
        />
        <div className="c-body">
          <PageContainer t={t} routes={routes} />
        </div>
        <Footer t={t} version="0.9.15" />
      </div>
    </div>
  );
};

export default TheLayout;
