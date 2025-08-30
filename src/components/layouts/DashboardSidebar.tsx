'use client';

import { Fragment, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useToast } from '@/providers/ToastProvider';
import {
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, status: 'working' },
  { name: 'Abandoned Carts', href: '/dashboard/carts', icon: ShoppingCartIcon, status: 'working' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, status: 'development' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: MegaphoneIcon, status: 'development' },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon, status: 'development' },
];

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check current theme
    const checkTheme = () => {
      const isDark = localStorage.theme === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleNavigationClick = (item: typeof navigation[0]) => {
    if (item.status === 'development') {
      showToast(`${item.name} feature is currently in development. Check back soon! 🚧`, 'info');
      onClose(); // Close mobile sidebar if open
    } else {
      router.push(item.href);
      onClose(); // Close mobile sidebar if open
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src={isDarkMode ? "/cartcash-logo-white.png" : "/cartcash-logo.png"}
                      alt="CartCash"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <button
                                onClick={() => handleNavigationClick(item)}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 w-full text-left
                                  ${pathname === item.href && item.status === 'working'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                    : item.status === 'development'
                                    ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 opacity-75'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }
                                `}
                              >
                                <item.icon
                                  className={`h-6 w-6 shrink-0 ${
                                    pathname === item.href && item.status === 'working'
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : item.status === 'development'
                                      ? 'text-gray-400 dark:text-gray-500'
                                      : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="flex-1">{item.name}</span>
                                {item.status === 'development' && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                    Soon
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src={isDarkMode ? "/cartcash-logo-white.png" : "/cartcash-logo.png"}
              alt="CartCash"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigationClick(item)}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 w-full text-left
                          ${pathname === item.href && item.status === 'working'
                            ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                            : item.status === 'development'
                            ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 opacity-75'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            pathname === item.href && item.status === 'working'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : item.status === 'development'
                              ? 'text-gray-400 dark:text-gray-500'
                              : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.status === 'development' && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
