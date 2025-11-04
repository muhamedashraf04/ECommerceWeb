using System.Linq.Expressions;

namespace ECommerceWeb.DataAccess.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        Task<T> GetAsync(Expression<Func<T, bool>> Filter);
        Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null);
        Task<T> CreateAsync(T obj);
        Task<bool> RemoveAsync(int id);
        Task EditAsync(T Obj);
        Task<IEnumerable<T>> GetAllAsync();

    }
}

