export default function DeleteModal({ projectId, onClose, onDelete }: any) {

  const handleDelete = () => {
    onDelete(projectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

      <div className="bg-white p-5 rounded-lg w-[300px]">

        <h2 className="font-bold mb-2">Excluir Projeto</h2>

        <p className="text-sm mb-4">
          Tem certeza que deseja excluir?
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>

          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Excluir
          </button>
        </div>

      </div>
    </div>
  );
}