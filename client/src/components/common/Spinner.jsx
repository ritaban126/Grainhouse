const Spinner = ({ size = "md" }) => {
  const sz = { sm: "w-3 h-3", md: "w-5 h-5", lg: "w-8 h-8" };
  return (
    <div className={`${sz[size]} border border-paper/20 border-t-paper/70 rounded-full animate-spin`} />
  );
};

export default Spinner