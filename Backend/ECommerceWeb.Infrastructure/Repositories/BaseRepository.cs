using System.Linq.Expressions;
using ECommerceWeb.Application.Interfaces;
using ECommerceWeb.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerceWeb.Infrastructure.Repositories
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        private readonly ApplicationDbContext _db;
        private readonly DbSet<T> _dbSet;
        public BaseRepository(ApplicationDbContext db)
        {
            _db = db;
            _dbSet = _db.Set<T>();
        }

        public async Task<bool> CreateAsync(T obj)
        {
            if (obj == null)
            {
                return false;
            }
            var success = await _dbSet.AddAsync(obj);
            return await SaveChangesAsync();
        }

        public async Task<bool> EditAsync(T obj)
        {
            if (obj == null) return false;

            _dbSet.Update(obj);
            return await SaveChangesAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null)
        {
            IQueryable<T> query = _dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            return await query.ToListAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {

            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetAsync(Expression<Func<T, bool>> filter)
        {
            return await _dbSet.FirstOrDefaultAsync(filter);
        }

        public async Task<bool> RemoveAsync(int id)
        {
            if (id <= 0)
                return false;

            var entity = await _dbSet.FindAsync(id);
            if (entity == null)
                return false;

            _dbSet.Remove(entity);
            return await SaveChangesAsync();
        }
        public async Task<bool> SaveChangesAsync()
        {
            return await _db.SaveChangesAsync() > 0;
        }
    }
}