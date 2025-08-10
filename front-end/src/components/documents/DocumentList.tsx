import { useEffect, useState, useCallback } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { fileDownloadUrl, getDocumentDetails } from "../../apis/documentApi";
import { debounce } from "lodash";
import { FiDownload } from "react-icons/fi";
import { usePermissionStore } from "../../stores/permissionStore";

interface Props {
  type: "booking" | "guest" | "purchase";
  perm:
    | "booking:file:download"
    | "guest:file:download"
    | "purchase:file:download";
}

const DocumentsList: React.FC<Props> = ({ type, perm }) => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const fetchDocuments = useCallback(
    debounce(async (searchTerm: string, currentPage: number) => {
      setLoading(true);
      try {
        const response = await getDocumentDetails(
          axiosPrivate,
          searchTerm,
          currentPage,
          limit,
          type
        );
        setDocuments(response?.documents || []);
        setTotalDocuments(response?.totalDocuments || 0);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    [axiosPrivate, limit, type]
  );

  useEffect(() => {
    fetchDocuments(search, page);
  }, [search, page, fetchDocuments]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const totalPages = Math.ceil(totalDocuments / limit);

  const handleDownload = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Prevent the row click event
    const resp = await fileDownloadUrl(axiosPrivate, fileName, type);

    if (resp.success) {
      const link = document.createElement("a");
      link.href = resp.signedUrl;
      link.download = fileName; // triggers browser download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">{type} Documents</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search documents..."
        value={search}
        onChange={handleSearchChange}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : documents.length > 0 ? (
        <>
          {/* Document List */}
          <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden shadow-sm">
            {documents.map((doc, index) => {
              const fileName = doc?.split("/").pop()?.split("-").pop();

              return (
                <li
                  key={index}
                  className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="truncate max-w-xs text-gray-800 font-medium">
                    {fileName}
                  </span>
                  {hasPermission(perm) && (
                    <button
                      onClick={(e) => handleDownload(e, doc)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Download"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-1 border rounded-md transition ${
                    pageNumber === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                setPage((prev) => (page < totalPages ? prev + 1 : prev))
              }
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No documents found.
        </div>
      )}
    </div>
  );
};

export default DocumentsList;
