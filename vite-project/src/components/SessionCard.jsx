const SessionCard = ({ session, completedSessionIds, handleMarkComplete }) => {
  const renderTipTapContent = (content) => {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-600 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: content || "No content available." }}
      />
    );
  };

  return (
    <div
      key={session.id}
      className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl shadow-md border-l-4 border-green-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-slide-up"
      aria-describedby={`session-${session.id}-description`}
    >
      <h4 className="text-xl font-semibold text-gray-900 mb-4">
        {session.title}
      </h4>
      {session.youtubeUrl && (
        <div className="mb-4 aspect-[16/9] w-full">
          <iframe
            src={session.youtubeUrl.replace("watch?v=", "embed/")}
            title={session.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        </div>
      )}
      <div
        id={`session-${session.id}-description`}
        className="text-sm text-gray-600 mb-6 line-clamp-3"
      >
        {renderTipTapContent(session.content)}
      </div>
      <button
        onClick={() => handleMarkComplete(session.id)}
        disabled={completedSessionIds.includes(session.id)}
        className={`mx-auto w-64 py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
          completedSessionIds.includes(session.id)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        }`}
        aria-label={
          completedSessionIds.includes(session.id)
            ? `Session ${session.title} completed`
            : `Mark session ${session.title} as complete`
        }
      >
        {completedSessionIds.includes(session.id)
          ? "Completed"
          : "Mark as Complete"}
      </button>
    </div>
  );
};

export default SessionCard;
