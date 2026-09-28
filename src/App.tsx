import { AppFooter } from './components/AppFooter';
import { AppRouter } from './app/router';
import { LanguageProvider } from './i18n';

function App() {
  return (
    <LanguageProvider>
      <AppRouter />
      <AppFooter />
    </LanguageProvider>
  );
}

export default App;
