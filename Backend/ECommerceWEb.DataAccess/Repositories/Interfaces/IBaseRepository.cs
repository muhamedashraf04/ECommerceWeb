using System.Linq.Expressions;

namespace ECommerceWeb.DataAccess.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        T Get(Expression<Func<T, bool>> Filter);
        IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null);
        void Create(T obj);
        bool Remove(int id);
        void Edit(T Obj);
        Task GetAsync(Expression<Func<bool>> filter);
        Task<IEnumerable<T>> GetAllAsync();

    }
}

