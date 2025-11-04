using System.Linq.Expressions;
using ECommerceWeb.DataAccess.Repositories.Interfaces;
namespace ECommerceWeb.DataAccess.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        public void Create(T obj)
        {
            throw new NotImplementedException();
        }

        public void Edit(T Obj)
        {
            throw new NotImplementedException();
        }

        public T Get(Expression<Func<T, bool>> Filter)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<T>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task GetAsync(Expression<Func<bool>> filter)
        {
            throw new NotImplementedException();
        }

        public bool Remove(int id)
        {
            throw new NotImplementedException();
        }
    }
}