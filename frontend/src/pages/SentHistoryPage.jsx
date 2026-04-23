import { useDeferredValue, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { messageApi } from "../services/api";

function formatDateParts(value) {
    if (!value) {
        return {
            date: "--",
            time: "--",
        };
    }

    const parsedDate = new Date(value);

    return {
        date: new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(parsedDate),
        time: new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(parsedDate),
    };
}

function getStatusStyles(status) {
    if (status === "sent") {
        return "bg-secondary/10 text-secondary";
    }

    if (status === "failed") {
        return "bg-error-container text-error";
    }

    return "bg-primary/10 text-primary";
}

export default function SentHistoryPage() {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isCancelled = false;
        setIsLoading(true);
        setErrorMessage("");

        messageApi
            .getHistory(
                {
                    page,
                    limit: 10,
                    status,
                    search: deferredSearch.trim(),
                },
                token,
            )
            .then((payload) => {
                if (isCancelled) {
                    return;
                }

                setHistory(payload.data.history);
                setPagination(payload.data.pagination);
            })
            .catch((error) => {
                if (isCancelled) {
                    return;
                }

                setErrorMessage(error.message || "Unable to load message history.");
                setHistory([]);
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [deferredSearch, page, status, token]);

    const sentCount = history.filter((item) => item.status === "sent").length;
    const failedCount = history.filter((item) => item.status === "failed").length;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-[32px] font-bold text-on-surface leading-[40px]" style={{ letterSpacing: "-0.02em" }}>
                        Sent History
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Review and track delivery status of all outbound communications.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                            search
                        </span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setPage(1);
                                setSearch(event.target.value);
                            }}
                            placeholder="Search recipient, phone, or message"
                            className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[260px]"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(event) => {
                                setPage(1);
                                setStatus(event.target.value);
                            }}
                            className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                            filter_list
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">history</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Records</p>
                            <h3 className="text-[24px] font-semibold text-on-surface leading-8" style={{ letterSpacing: "-0.01em" }}>
                                {pagination.total}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-sm mr-1">stacked_bar_chart</span>
                        <span>Across all pages</span>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-secondary-container">send</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sent On This Page</p>
                            <h3 className="text-[24px] font-semibold text-on-surface leading-8" style={{ letterSpacing: "-0.01em" }}>
                                {sentCount}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-sm mr-1">page_info</span>
                        <span>Page {pagination.page} snapshot</span>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-error">error</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Failed On This Page</p>
                            <h3 className="text-[24px] font-semibold text-on-surface leading-8" style={{ letterSpacing: "-0.01em" }}>
                                {failedCount}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center text-error text-sm">
                        <span className="material-symbols-outlined text-sm mr-1">warning</span>
                        <span>Failures need follow-up</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
                {errorMessage ? (
                    <div className="border-b border-surface-variant bg-error-container px-6 py-4 text-sm text-on-error-container">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-surface-variant">
                                <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Recipient</th>
                                <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-1/3">Message Preview</th>
                                <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date & Time</th>
                                <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Source</th>
                                <th className="py-4 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant text-sm text-on-surface">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 px-6 text-center text-on-surface-variant">
                                        Loading message history...
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 px-6 text-center text-on-surface-variant">
                                        No messages matched the current filters yet.
                                    </td>
                                </tr>
                            ) : (
                                history.map((entry) => {
                                    const { date, time } = formatDateParts(entry.sentAt || entry.createdAt);

                                    return (
                                        <tr key={entry._id} className="hover:bg-surface-container-low/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium">{entry.phoneNumber}</p>
                                                    <p className="text-xs text-on-surface-variant">
                                                        {entry.recipientName || "Unnamed recipient"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="line-clamp-2 text-on-surface-variant">{entry.message}</div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <p>{date}</p>
                                                <p className="text-xs text-on-surface-variant">{time}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-xs capitalize">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {entry.source === "bulk" ? "outbox" : "send"}
                                                    </span>
                                                    {entry.source}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyles(entry.status)}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between gap-4">
                    <p className="text-xs text-on-surface-variant">
                        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                            className="px-3 py-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50"
                            disabled={pagination.page <= 1 || isLoading}
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setPage((currentPage) =>
                                    Math.min(pagination.totalPages || 1, currentPage + 1),
                                )
                            }
                            className="px-3 py-2 rounded border border-outline-variant hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50"
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
