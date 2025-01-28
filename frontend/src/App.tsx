import BoardgameMain from "@/boardgames/BoardgameMain";
import {Route} from "react-router";
import ConsolegameMain from "@/consolegames/ConsolegameMain";


export const setTheme = (theme: 'light' | 'dark' | 'auto') => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('light', 'dark');

    if (theme === 'auto') {
        localStorage.removeItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlElement.classList.toggle('dark', prefersDark);
        htmlElement.classList.toggle('light', !prefersDark);
    } else {
        localStorage.theme = theme;
        htmlElement.classList.add(theme);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.theme as 'light' | 'dark' | undefined;
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('auto');
    }
});

const App = () => {
    return (
        <Routes>
            <Route index element={<BoardgameMain />} />
            <Route path="console" element={<ConsolegameMain />} />
        </Routes>
    );
};

export default App;
