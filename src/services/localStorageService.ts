/**
 * Retrieves an item from Local Storage.
 * @param key The key of the item to retrieve.
 * @returns The parsed item, or null if not found or an error occurs.
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Sets an item in Local Storage.
 * @param key The key of the item to set.
 * @param value The value to set (will be stringified).
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key} to localStorage:`, error);
  }
}

/**
 * Removes an item from Local Storage.
 * @param key The key of the item to remove.
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
  }
}
