
namespace DataAccess.RequestFeatures
{

    
    public class PagedResult<T>
    {
        public List<T> Items { get; set; }
        public MetaData MetaData { get; set; }
    }
}