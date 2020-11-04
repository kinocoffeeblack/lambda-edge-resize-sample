import urllib.parse

MAX_WIDTH = 1500;
MIN_WIDTH = 1;

"""
ViewerRequestFunction.
"""


def lambda_handler(event, context):
    print('event', event)
    
    request = event['Records'][0]['cf']['request']
    queryparams = urllib.parse.parse_qs(request['querystring'])
    
    if not 'w' in queryparams:
        return request
    
    print('queryparams', queryparams)
    
    width = int(queryparams['w'][0])
    
    if width > MAX_WIDTH:
        print('too large specific width:', width)
        return request
    elif width < MIN_WIDTH:
        print('too small specific width:', width)
        return request

    uriParts = request['uri'].split('/');
    print('uriParts', uriParts)
    
    uriParts.insert(2, 'w' + queryparams['w'][0])
    fwdUri = '/'.join(uriParts)
    print('fwdUri', fwdUri)
    
    request['uri'] = fwdUri
    return request