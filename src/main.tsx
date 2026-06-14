import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'
import { registerChinaMap } from './lib/echartsChinaMap'

const RootApp = () => {
  useEffect(() => {
    registerChinaMap()
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0F766E',
          colorSuccess: '#059669',
          colorWarning: '#D97706',
          colorError: '#DC2626',
          colorInfo: '#0891B2',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <StrictMode>
          <App />
        </StrictMode>
      </AntdApp>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(<RootApp />)
