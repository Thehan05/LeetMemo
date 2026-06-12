export function getStoredValues(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, result => {
            const error = chrome.runtime.lastError;

            if (error) {
                reject(error);
                return;
            }

            resolve(result);
        });
    });
}

export function setStoredValues(values) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(values, () => {
            const error = chrome.runtime.lastError;

            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}
