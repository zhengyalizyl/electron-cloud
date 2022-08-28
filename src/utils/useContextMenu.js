import { useEffect } from "react";
const { app, dialog, Menu, MenuItem, getCurrentWindow } = window.require('@electron/remote'); //electron 14之后改了


export const useContextMenu = (itemArr) => {
    useEffect(() => {
        const menu = new Menu();
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        });
        const handleContextMenu = (e) => {
            menu.popup({
                window: getCurrentWindow()
            })
        }
        window.addEventListener('contextmenu', handleContextMenu);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [])
}