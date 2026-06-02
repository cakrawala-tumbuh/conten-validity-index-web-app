/**
 * Unit test untuk komponen ServiceWorkerRegistrar.
 *
 * Menguji pendaftaran service worker pada event `load`, perilaku saat
 * `serviceWorker` tidak didukung, dan penanganan error pendaftaran.
 */
import { render } from "@testing-library/react";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

/**
 * Memasang mock `navigator.serviceWorker` dengan fungsi register tertentu.
 *
 * @param register - Mock untuk `navigator.serviceWorker.register`.
 */
const setServiceWorker = (register: jest.Mock): void => {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { register },
  });
};

/**
 * Menghapus mock `navigator.serviceWorker` agar test lain bersih.
 */
const clearServiceWorker = (): void => {
  Reflect.deleteProperty(navigator as unknown as Record<string, unknown>, "serviceWorker");
};

describe("ServiceWorkerRegistrar", () => {
  afterEach(() => {
    clearServiceWorker();
    jest.restoreAllMocks();
  });

  it("tidak boleh merender elemen apa pun", () => {
    const { container } = render(<ServiceWorkerRegistrar />);
    expect(container).toBeEmptyDOMElement();
  });

  it("harus mendaftarkan /sw.js saat window load dipicu", () => {
    const register = jest.fn().mockResolvedValue(undefined);
    setServiceWorker(register);

    render(<ServiceWorkerRegistrar />);
    window.dispatchEvent(new Event("load"));

    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("tidak boleh memanggil register jika serviceWorker tidak didukung", () => {
    const register = jest.fn();
    // Sengaja TIDAK memasang navigator.serviceWorker.
    render(<ServiceWorkerRegistrar />);
    window.dispatchEvent(new Event("load"));

    expect(register).not.toHaveBeenCalled();
  });

  it("harus menangani kegagalan pendaftaran tanpa melempar error", async () => {
    const error = new Error("registrasi gagal");
    const register = jest.fn().mockRejectedValue(error);
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    setServiceWorker(register);

    render(<ServiceWorkerRegistrar />);
    window.dispatchEvent(new Event("load"));

    // Tunggu microtask agar promise register selesai.
    await Promise.resolve();
    await Promise.resolve();

    expect(register).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });
});
