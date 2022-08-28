import { useEffect, useRef } from "react";
const { app, dialog, Menu, MenuItem, getCurrentWindow } = window.require('@electron/remote'); //electron 14之后改了


export const useContextMenu = (itemArr, targetSelector, deps) => {
    let clickedElement = useRef(null)
    useEffect(() => {
        const menu = new Menu();
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        });
        const handleContextMenu = (e) => {
            if (document.querySelector(targetSelector).contains(e.target)) {
                clickedElement.current = e.target;
                menu.popup({
                    window: getCurrentWindow()
                })
            }

        }
        window.addEventListener('contextmenu', handleContextMenu);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    }, deps)

    return clickedElement;
}