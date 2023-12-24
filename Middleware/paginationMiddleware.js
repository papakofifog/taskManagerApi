const paginationMiddleware=(req, res, next)=>{
   try{
    
        const pageNumber = parseInt(req.query.page) || 1 //get the current page number from the query parameters
        const pageSize= parseInt(req.query.pageSize)|| 5;
        
        const startIndex= (pageNumber -1)*pageSize;
        const endIndex= startIndex+ pageSize;

        //Attach paginatioon data to the request object

        req.pagination = {
            page: pageNumber,
            limit: pageSize,
            startIndex,
            endIndex
        }

        next(); // Call the next middleware
    
   }catch(e){
    return next(e);
   }
}

module.exports= {paginationMiddleware}